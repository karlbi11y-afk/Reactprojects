#!/usr/bin/env node
/**
 * The Royal Kave — logotypberedning
 *
 *   node prepare-logos.mjs [källmapp]
 *
 * Läser de sex källbilderna (sigill / ordbild / krön, svart + vit), gör bakgrunden
 * genomskinlig, trimmar bort tom yta och skriver hela assetuppsättningen till
 * logos/dist/ och logos/dist/video/. Se ROYALKAVE-DESIGN-SYSTEM.md §9.
 *
 * Källfilerna identifieras på bildmått och ljushet — filnamnen spelar ingen roll.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SRC_DIR = path.resolve(process.argv[2] || path.join(HERE, "logos", "source"));
const DIST = path.join(HERE, "logos", "dist");
const VIDEO = path.join(DIST, "video");

const INK = { r: 0x11, g: 0x11, b: 0x11 };
const PAPER = { r: 0xff, g: 0xff, b: 0xff };
const VOID_HEX = "#0d0d0d";
const VOID_RGB = { r: 0x0d, g: 0x0d, b: 0x0d };

// ── sharp ────────────────────────────────────────────────────────────────────
async function loadSharp() {
  const candidates = [
    "sharp",
    pathToFileURL(path.join(HERE, "node_modules", "sharp", "lib", "index.js")).href,
    pathToFileURL("C:/ReactProjects/clothespin/node_modules/sharp/lib/index.js").href,
    pathToFileURL("C:/ReactProjects/clothespin/Backend/node_modules/sharp/lib/index.js").href,
  ];
  for (const c of candidates) {
    try {
      const m = await import(c);
      return m.default ?? m;
    } catch {
      /* nästa */
    }
  }
  console.error(
    "Hittar inte sharp. Kör:  npm i sharp\n" +
      "eller peka NODE_PATH mot en installation som har det."
  );
  process.exit(1);
}
const sharp = await loadSharp();

// ── klassificering ───────────────────────────────────────────────────────────
/** Vilken markör är det? Avgörs på proportionerna i originalet. */
function markFromRatio(w, h) {
  const r = w / h;
  if (r > 3) return "wordmark"; // 7762 × 1418 ≈ 5.47
  if (r > 1.04 && r < 1.35) return "crest"; // 4834 × 4344 ≈ 1.11
  if (r >= 0.9 && r <= 1.04) return "seal"; // 6328 × 6328 = 1.00
  return null;
}

/**
 * Svart eller vit variant? Tittar först på om bilden har genomskinlighet.
 * - genomskinlig  → medelljuset hos de synliga pixlarna avgör
 * - ogenomskinlig → hörnens ljushet är bakgrunden, motivet är motsatsen
 */
function analyse(data, w, h, channels) {
  const px = w * h;
  const hasAlpha = channels === 4;

  let opaque = 0;
  let lumSum = 0;
  let transparent = 0;

  for (let i = 0; i < px; i++) {
    const o = i * channels;
    const a = hasAlpha ? data[o + 3] : 255;
    if (a < 128) {
      transparent++;
      continue;
    }
    opaque++;
    lumSum += 0.2126 * data[o] + 0.7152 * data[o + 1] + 0.0722 * data[o + 2];
  }

  const transparentRatio = transparent / px;

  // Hörnens ljushet = bakgrunden när bilden saknar genomskinlighet
  const corner = (cx, cy) => {
    let s = 0;
    let n = 0;
    for (let y = cy; y < cy + 8; y++) {
      for (let x = cx; x < cx + 8; x++) {
        const o = (y * w + x) * channels;
        s += 0.2126 * data[o] + 0.7152 * data[o + 1] + 0.0722 * data[o + 2];
        n++;
      }
    }
    return s / n;
  };
  const bgLum =
    (corner(0, 0) + corner(w - 9, 0) + corner(0, h - 9) + corner(w - 9, h - 9)) / 4;

  if (transparentRatio > 0.15) {
    const meanLum = opaque ? lumSum / opaque : 0;
    return { variant: meanLum < 128 ? "black" : "white", bg: "alpha", bgLum };
  }
  // Ogenomskinlig: ljus bakgrund ⇒ mörkt motiv, och tvärtom
  return { variant: bgLum > 128 ? "black" : "white", bg: bgLum > 128 ? "light" : "dark", bgLum };
}

// ── genomskinlighet ──────────────────────────────────────────────────────────
/**
 * Nycklar bort en enfärgad bakgrund och behåller kantutjämningen:
 * alfa sätts till avståndet från bakgrundsljuset, färgen sätts till märkesfärgen.
 */
function keyOut(data, w, h, channels, bg, variant) {
  const out = Buffer.alloc(w * h * 4);
  const ink = variant === "black" ? INK : PAPER;

  for (let i = 0, px = w * h; i < px; i++) {
    const o = i * channels;
    const q = i * 4;
    const a = channels === 4 ? data[o + 3] : 255;
    const lum = 0.2126 * data[o] + 0.7152 * data[o + 1] + 0.0722 * data[o + 2];

    let alpha;
    if (bg === "alpha") {
      alpha = a;
    } else if (bg === "light") {
      alpha = Math.round(255 - lum); // vit bakgrund → svart motiv
    } else {
      alpha = Math.round(lum); // svart bakgrund → vitt motiv
    }

    // Golv: bakgrunder som inte är exakt rena (#0d0d0d, #f2f2f2 …) lämnar annars
    // ett svagt dis över hela ytan som förstör både trimningen och videolagren.
    if (alpha < 16) alpha = 0;

    out[q] = ink.r;
    out[q + 1] = ink.g;
    out[q + 2] = ink.b;
    out[q + 3] = Math.max(0, Math.min(255, alpha));
  }
  return out;
}

/** Minsta rektangel som rymmer allt med alfa över tröskeln. */
function bbox(rgba, w, h, threshold = 8) {
  let x0 = w;
  let y0 = h;
  let x1 = -1;
  let y1 = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (rgba[(y * w + x) * 4 + 3] > threshold) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
    }
  }
  if (x1 < 0) return { left: 0, top: 0, width: w, height: h };
  return { left: x0, top: y0, width: x1 - x0 + 1, height: y1 - y0 + 1 };
}

// ── hjälpare ─────────────────────────────────────────────────────────────────
const withOpacity = (buf, opacity) =>
  sharp(buf)
    .ensureAlpha()
    .composite([
      {
        input: {
          create: {
            width: 1,
            height: 1,
            channels: 4,
            background: { r: 0, g: 0, b: 0, alpha: opacity },
          },
        },
        tile: true,
        blend: "dest-in",
      },
    ])
    .png()
    .toBuffer();

const canvas = (w, h, background) =>
  sharp({ create: { width: w, height: h, channels: 4, background } });

let written = 0;
async function write(dir, name, pipeline) {
  const file = path.join(dir, name);
  await pipeline.png({ compressionLevel: 9 }).toFile(file);
  const kb = (fs.statSync(file).size / 1024).toFixed(0);
  console.log(`  ✓ ${path.relative(HERE, file).replace(/\\/g, "/")}  (${kb} kB)`);
  written++;
}

// ── körning ──────────────────────────────────────────────────────────────────
if (!fs.existsSync(SRC_DIR)) {
  console.error(`Källmappen finns inte: ${SRC_DIR}`);
  process.exit(1);
}
fs.mkdirSync(DIST, { recursive: true });
fs.mkdirSync(VIDEO, { recursive: true });

const files = fs
  .readdirSync(SRC_DIR)
  .filter((f) => /\.(png|jpe?g|webp|tiff?)$/i.test(f))
  .map((f) => path.join(SRC_DIR, f));

if (!files.length) {
  console.error(
    `Inga bilder i ${SRC_DIR}\n` +
      "Lägg de sex källfilerna där (sigill 6328×6328, ordbild 7762×1418, krön 4834×4344 — svart + vit)."
  );
  process.exit(1);
}

console.log(`Läser ${files.length} källfil(er) från ${SRC_DIR}\n`);

/** @type {Record<string, Buffer>} nyckel: "seal-black" osv → trimmad RGBA-PNG */
const marks = {};

for (const file of files) {
  const img = sharp(file);
  const meta = await img.metadata();
  const mark = markFromRatio(meta.width, meta.height);
  if (!mark) {
    console.log(`  – hoppar över ${path.basename(file)} (${meta.width}×${meta.height}, okänd form)`);
    continue;
  }

  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const { variant, bg } = analyse(data, info.width, info.height, info.channels);
  const rgba = keyOut(data, info.width, info.height, info.channels, bg, variant);
  const box = bbox(rgba, info.width, info.height);

  const trimmed = await sharp(rgba, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .extract(box)
    .png()
    .toBuffer();

  const key = `${mark}-${variant}`;
  if (marks[key]) console.log(`  ! ${key} fanns redan — ${path.basename(file)} skriver över`);
  marks[key] = trimmed;
  console.log(
    `  · ${path.basename(file)} → ${key}  (${info.width}×${info.height} → ${box.width}×${box.height})`
  );
}

const need = [
  "seal-black",
  "seal-white",
  "wordmark-black",
  "wordmark-white",
  "crest-black",
  "crest-white",
];
const missing = need.filter((k) => !marks[k]);
if (missing.length) {
  console.log(`\n⚠ Saknas: ${missing.join(", ")} — de filerna hoppas över nedan.`);
}

console.log("\nSkriver grunduppsättning:");

// Sigill — kvadratiskt
for (const v of ["black", "white"]) {
  const src = marks[`seal-${v}`];
  if (!src) continue;
  for (const s of [256, 512, 1024, 2048]) {
    await write(
      DIST,
      `rk-seal-${v}-${s}.png`,
      sharp(src).resize(s, s, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    );
  }
}

// Ordbild och krön — breddstyrda
for (const mark of ["wordmark", "crest"]) {
  for (const v of ["black", "white"]) {
    const src = marks[`${mark}-${v}`];
    if (!src) continue;
    for (const s of [512, 1024, 2048, 4096]) {
      await write(DIST, `rk-${mark}-${v}-${s}.png`, sharp(src).resize({ width: s }));
    }
  }
}

// Favicon — sigill, svart
if (marks["seal-black"]) {
  for (const s of [32, 64, 180, 512]) {
    await write(
      DIST,
      `rk-favicon-${s}.png`,
      sharp(marks["seal-black"]).resize(s, s, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
    );
  }
}

console.log("\nSkriver videofärdiga lager:");

const FORMATS = [
  { w: 1080, h: 1920, safe: { top: 120, bottom: 420, side: 80 } }, // reel / story
  { w: 1080, h: 1080, safe: { top: 80, bottom: 80, side: 80 } }, // feed
  { w: 1920, h: 1080, safe: { top: 90, bottom: 90, side: 90 } }, // landskap
  { w: 3840, h: 2160, safe: { top: 180, bottom: 180, side: 180 } }, // master
];

// Vattenstämpel: sigill i övre högra hörnet, 6 % av kortsidan, 55 % opacitet
for (const v of ["white", "black"]) {
  const src = marks[`seal-${v}`];
  if (!src) continue;
  for (const f of FORMATS) {
    const short = Math.min(f.w, f.h);
    const size = Math.round(short * 0.06);
    const margin = Math.round(48 * (short / 1080));
    const seal = await withOpacity(
      await sharp(src)
        .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toBuffer(),
      0.55
    );
    await write(
      VIDEO,
      `rk-watermark-${v}-${f.w}x${f.h}.png`,
      canvas(f.w, f.h, { r: 0, g: 0, b: 0, alpha: 0 }).composite([
        { input: seal, left: f.w - margin - size, top: margin },
      ])
    );
  }
}

// Nedre tredjedel: ordbild vänsterställd i säker zon, genomskinlig
if (marks["wordmark-white"]) {
  for (const f of FORMATS.filter((x) => (x.w === 1920 && x.h === 1080) || (x.w === 1080 && x.h === 1920))) {
    const height = Math.round(f.h * 0.04);
    const wm = await sharp(marks["wordmark-white"]).resize({ height }).png().toBuffer();
    const wmMeta = await sharp(wm).metadata();
    await write(
      VIDEO,
      `rk-lowerthird-${f.w}x${f.h}.png`,
      canvas(f.w, f.h, { r: 0, g: 0, b: 0, alpha: 0 }).composite([
        { input: wm, left: f.safe.side, top: f.h - f.safe.bottom - wmMeta.height },
      ])
    );
  }
}

// Slutbild: krön centrerat på #0d0d0d
if (marks["crest-white"]) {
  for (const f of FORMATS) {
    const width = Math.round(f.w * 0.62);
    const crest = await sharp(marks["crest-white"]).resize({ width }).png().toBuffer();
    const m = await sharp(crest).metadata();
    await write(
      VIDEO,
      `rk-endcard-${f.w}x${f.h}.png`,
      canvas(f.w, f.h, { ...VOID_RGB, alpha: 1 }).composite([
        {
          input: crest,
          left: Math.round((f.w - m.width) / 2),
          top: Math.round((f.h - m.height) / 2),
        },
      ])
    );
  }
}

// Öppningsbild: ordbild centrerad på #0d0d0d
if (marks["wordmark-white"]) {
  for (const f of FORMATS.filter((x) => (x.w === 1920 && x.h === 1080) || (x.w === 1080 && x.h === 1920))) {
    const width = Math.round(f.w * 0.72);
    const wm = await sharp(marks["wordmark-white"]).resize({ width }).png().toBuffer();
    const m = await sharp(wm).metadata();
    await write(
      VIDEO,
      `rk-titlecard-${f.w}x${f.h}.png`,
      canvas(f.w, f.h, { ...VOID_RGB, alpha: 1 }).composite([
        {
          input: wm,
          left: Math.round((f.w - m.width) / 2),
          top: Math.round((f.h - m.height) / 2),
        },
      ])
    );
  }
}

// Manifest
const manifest = [
  "# Royal Kave — genererade logotypfiler",
  "",
  `Skapade ${new Date().toISOString().slice(0, 10)} av \`prepare-logos.mjs\`.`,
  "Alla filer utom slutbild/öppningsbild har genomskinlig bakgrund.",
  `Slutbild och öppningsbild har massiv bakgrund ${VOID_HEX}.`,
  "",
  "| Fil | Storlek |",
  "|---|---|",
  ...[DIST, VIDEO].flatMap((dir) =>
    fs
      .readdirSync(dir)
      .filter((f) => f.endsWith(".png"))
      .sort()
      .map((f) => {
        const rel = path.relative(DIST, path.join(dir, f)).replace(/\\/g, "/");
        const kb = (fs.statSync(path.join(dir, f)).size / 1024).toFixed(0);
        return `| \`${rel}\` | ${kb} kB |`;
      })
  ),
  "",
].join("\n");
fs.writeFileSync(path.join(DIST, "MANIFEST.md"), manifest, "utf8");

console.log(`\nKlart. ${written} filer skrivna till ${path.relative(HERE, DIST).replace(/\\/g, "/")}/`);
console.log("Manifest: logos/dist/MANIFEST.md");
