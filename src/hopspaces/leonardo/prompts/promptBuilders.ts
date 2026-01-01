import { HopSpaceType, HopSpaceMood } from "../leonardoClient";

// -----------------------------
// COVER IMAGE PROMPT
// -----------------------------
export function buildCoverPrompt(
  name: string,
  type: HopSpaceType,
  mood: HopSpaceMood
): string {
  return `
Create a high‑resolution cosmic emblem for a HopSpace called "${name}".
The Space type is "${type}", and the emotional mood is "${mood}".

Style the emblem as a glowing celestial body — a planet, star, or nebula —
with swirling colors and textures that reflect the mood.
Use vibrant neon lighting, soft atmospheric glow, and subtle cosmic details
(star particles, orbit rings, energy flares).

The design should feel alive, expressive, and slightly surreal,
matching a futuristic cosmic OS aesthetic.
Avoid text, avoid UI elements — this is a pure visual identity symbol.
`.trim();
}

// -----------------------------
// BACKGROUND TEXTURE PROMPT
// -----------------------------
export function buildBackgroundPrompt(
  name: string,
  type: HopSpaceType,
  mood: HopSpaceMood
): string {
  return `
Generate an abstract cosmic background texture for a HopSpace named "${name}".
The Space type is "${type}", and the mood is "${mood}".

The background should be a flowing nebula or atmospheric gradient
with soft motion energy, subtle star particles, and layered depth.
Use colors that match the mood and blend smoothly.
The style should feel ambient, immersive, and non-distracting —
perfect as a backdrop for an interactive creative environment.

No text, no symbols, no characters — only atmospheric cosmic texture.
`.trim();
}

// -----------------------------
// ANIMA AVATAR PROMPT
// -----------------------------
export function buildAnimaAvatarPrompt(
  name: string,
  mood: HopSpaceMood
): string {
  return `
Create a glowing AI entity avatar for an Anima Space called "${name}".
The mood is "${mood}".

The avatar should appear as a luminous, abstract being —
a shifting star, nebula spirit, or geometric energy form.
It should feel intelligent, calm, and expressive,
with smooth gradients, neon highlights, and soft particle trails.

Avoid humanoid realism; keep it abstract and cosmic.
No text, no UI elements — only the entity itself.
`.trim();
}

// -----------------------------
// CONCEPT ART PROMPT
// -----------------------------
export function buildConceptArtPrompt(
  subject: string,
  type: HopSpaceType,
  mood: HopSpaceMood
): string {
  return `
Generate concept art for "${subject}" within the HopSpace universe.
The mood is "${mood}", and the Space type is "${type}".

Use a cosmic, neon‑infused art style with expressive lighting,
soft atmospheric depth, and subtle starfield elements.
The design should feel imaginative, otherworldly, and emotionally resonant.

Avoid text or UI elements — this is pure concept art.
`.trim();
}

// -----------------------------
// MOODBOARD PROMPT
// -----------------------------
export function buildMoodboardPrompt(
  name: string,
  type: HopSpaceType,
  mood: HopSpaceMood
): string {
  return `
Create a moodboard for a HopSpace named "${name}",
with the type "${type}" and mood "${mood}".

Include color palettes, texture swatches, lighting styles,
and atmospheric references that match the emotional tone.
Use cosmic, neon, and fluid aesthetics with layered depth.

No text, no UI, no logos — only visual mood references.
`.trim();
}
