#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "chunk_includes", "elevenlabs_audio");
const ZIP_PATH = path.join(ROOT, "chunk_includes", "elevenlabs_audio.zip");

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || "XX";
// Adam: male, US English default voice.
const ELEVENLABS_VOICE_ID =
  process.env.ELEVENLABS_VOICE_ID || "pNInz6obpgDQGcFmaJgB";
const ELEVENLABS_MODEL_ID =
  process.env.ELEVENLABS_MODEL_ID || "eleven_turbo_v2_5";
const ELEVENLABS_FORCE_REGEN =
  process.env.ELEVENLABS_FORCE_REGEN === "1" || process.env.FORCE_REGEN === "1";
const ELEVENLABS_VOICE_SETTINGS = {
  stability: 0.45,
  similarity_boost: 0.8,
  style: 0.35,
  use_speaker_boost: true,
};

const ENTITIES = ["Pirate", "Chef", "Wizard"];
const VERBS = [
  "blow",
  "build",
  "carry",
  "climb",
  "dig",
  "drink",
  "eat",
  "paint",
  "peel",
  "play",
  "push",
  "read",
  "ride",
  "shake",
  "smell",
  "spin",
  "stir",
  "sweep",
  "wash",
  "drag",
];

const OBJECT_PHRASE_BY_VERB = {
  blow: "bubbles",
  build: "a tower",
  carry: "a box",
  climb: "a ladder",
  dig: "a hole",
  drag: "a sack",
  drink: "coffee",
  eat: "an apple",
  paint: "a canvas",
  peel: "a banana",
  play: "the guitar",
  push: "a cart",
  read: "a book",
  ride: "a bicycle",
  shake: "a bottle",
  smell: "a flower",
  spin: "a top",
  stir: "a pot",
  sweep: "the floor",
  wash: "a dish",
};

const GERUND_FORMS = {
  blow: "blowing",
  build: "building",
  carry: "carrying",
  climb: "climbing",
  dig: "digging",
  drag: "dragging",
  drink: "drinking",
  eat: "eating",
  paint: "painting",
  peel: "peeling",
  play: "playing",
  push: "pushing",
  read: "reading",
  ride: "riding",
  shake: "shaking",
  smell: "smelling",
  spin: "spinning",
  stir: "stirring",
  sweep: "sweeping",
  wash: "washing",
};

// Force target pronunciations where orthography is ambiguous for TTS.
const VERB_TEXT_OVERRIDES = {
  read: "red a book",
};

function withObject(verb) {
  if (VERB_TEXT_OVERRIDES[verb]) return VERB_TEXT_OVERRIDES[verb];
  return `${verb} ${OBJECT_PHRASE_BY_VERB[verb]}`;
}

function eventPhrase(verb) {
  return `${GERUND_FORMS[verb]} ${OBJECT_PHRASE_BY_VERB[verb]}`;
}

function sentencePast(entity, verb) {
  return `The ${entity}'s ${eventPhrase(verb)} is in the past.`;
}

function sentenceFuture(entity, verb) {
  return `The ${entity}'s ${eventPhrase(verb)} is in the future.`;
}

function buildEntries() {
  const entries = [];

  for (const verb of VERBS) {
    entries.push({
      id: `verb:${verb}`,
      file: `tts_verb_${verb}.mp3`,
      text: withObject(verb),
    });
  }

  for (const entity of ENTITIES) {
    const entityLower = entity.toLowerCase();
    for (const verb of VERBS) {
      entries.push({
        id: `sentence:${entityLower}:${verb}:past`,
        file: `tts_sent_${entityLower}_${verb}_past.mp3`,
        text: sentencePast(entity, verb),
      });
      entries.push({
        id: `sentence:${entityLower}:${verb}:future`,
        file: `tts_sent_${entityLower}_${verb}_future.mp3`,
        text: sentenceFuture(entity, verb),
      });
    }
  }

  return entries;
}

async function fetchMp3(text) {
  const endpoint =
    `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}` +
    `?output_format=mp3_44100_128`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "xi-api-key": ELEVENLABS_API_KEY,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text,
      model_id: ELEVENLABS_MODEL_ID,
      voice_settings: ELEVENLABS_VOICE_SETTINGS,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`ElevenLabs request failed (${response.status}): ${body}`);
  }

  return Buffer.from(await response.arrayBuffer());
}

function zipOutputFolder() {
  if (fs.existsSync(ZIP_PATH)) fs.unlinkSync(ZIP_PATH);
  const result = spawnSync("zip", ["-q", "-r", ZIP_PATH, "."], {
    cwd: OUT_DIR,
    stdio: "inherit",
  });
  if (result.status !== 0) {
    throw new Error("zip command failed while creating elevenlabs_audio.zip");
  }
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const entries = buildEntries();
  const manifest = {
    generated_at: new Date().toISOString(),
    voice_id: ELEVENLABS_VOICE_ID,
    model_id: ELEVENLABS_MODEL_ID,
    voice_settings: ELEVENLABS_VOICE_SETTINGS,
    total_entries: entries.length,
    entries,
  };

  fs.writeFileSync(
    path.join(OUT_DIR, "manifest.json"),
    JSON.stringify(manifest, null, 2),
  );
  fs.writeFileSync(
    path.join(OUT_DIR, "texts.tsv"),
    entries.map((e) => `${e.file}\t${e.text}`).join("\n") + "\n",
  );

  if (!ELEVENLABS_API_KEY || ELEVENLABS_API_KEY === "XX") {
    console.log(
      "ELEVENLABS_API_KEY is not set. Generated manifest/texts only.",
    );
    console.log("Set ELEVENLABS_API_KEY to generate mp3 files.");
    zipOutputFolder();
    console.log(`Created ${ZIP_PATH}`);
    return;
  }

  let generated = 0;
  let skipped = 0;
  for (const entry of entries) {
    const outFile = path.join(OUT_DIR, entry.file);
    if (!ELEVENLABS_FORCE_REGEN && fs.existsSync(outFile)) {
      skipped += 1;
      continue;
    }

    const mp3 = await fetchMp3(entry.text);
    fs.writeFileSync(outFile, mp3);
    generated += 1;
    process.stdout.write(`Generated ${generated}/${entries.length}\r`);
  }
  process.stdout.write("\n");
  console.log(`Generated: ${generated}, skipped existing: ${skipped}`);

  zipOutputFolder();
  console.log(`Created ${ZIP_PATH}`);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
