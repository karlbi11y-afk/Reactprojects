# The Royal Kave — Designsystem

> **Vad det här är:** ett komplett, självbärande designsystem för The Royal Kave (STHLM Artistry, est. 2008).
> Filen är skriven för att kunna lämnas rakt av till Claude Design / en formgivare / en videoredigerare utan extra kontext.
>
> **Version:** 1.0 · 2026-08-18
> **Rot:** `inkrevenue/design-system/royalkave/`

---

## 1. Varumärket i en mening

Royal Kave är en heraldisk, strikt svartvit tatueringsstudio i Stockholm — hovmässig precision, inte gatustil.
Allt uttryck utgår från tre ord: **ceremoniellt, monokromt, skarpt.**

| | |
|---|---|
| **Grundat** | 2008 (bärs av `20` / `08` i sigillet) |
| **Ort** | Stockholm — signeras `STHLM ARTISTRY` |
| **Symbolvärld** | krona, räv-/drakhuvud, lagerkrans, fleur-de-lis, cirkelsigill |
| **Färgvärld** | ren monokrom. Ingen färg i logotypen. Någonsin. |
| **Ton** | knapphändig. Korta rader, versaler, inga utropstecken. |

---

## 2. Logotypfamiljen

Tre markörer. De är inte utbytbara — var och en har ett jobb.

### 2.1 Sigillet (`seal`)

Cirkulärt emblem: yttre ring, krönt rävhuvud, `20` och `08` flankerande.
**Används när ytan är liten eller kvadratisk.** Favicon, profilbild, stämpel på foto, hörnvattenstämpel i video, klistermärke.
Aldrig som huvudlogotyp i ett sidhuvud.

### 2.2 Ordbilden (`wordmark`)

`ROYAL KAVE` satt i en högkontrast-Didone där **O:et i ROYAL innehåller sigillet**.
**Standardlogotypen.** Sidhuvud, brevpapper, e-postsignatur, nedre tredjedel i video, alla breda ytor.
O:et med sigillet får aldrig ersättas med ett vanligt O.

### 2.3 Krönet (`crest`)

Fullt lås: `THE` överst, stort **K** bakom lagerkrans, `ROYAL` / `KAVE` flankerande, `STHLM ARTISTRY` med fleur-de-lis underst.
**Ceremoniell användning.** Slutbild i video, affisch, tröjtryck, entré, presentkort.
Aldrig under 240 px bred — lagerkransens linjer försvinner.

### 2.4 Val av variant

| Bakgrund | Variant | Fil-suffix |
|---|---|---|
| Vit / ljust foto / papper | Svart | `-black` |
| Svart / mörkt foto / video | Vit | `-white` |
| Rörligt eller brokigt foto | Vit **+** mörk platta bakom | `-white` |

Det finns **inga andra färgvarianter**. Ingen guldfolie i digitalt, ingen gradient, ingen kontur.

---

## 3. Frizon och minsta storlek

**Frizon** = höjden på `K` i den logotyp du använder, runt om, på alla fyra sidor.
Inget får in i frizonen: ingen text, ingen bildkant, ingen knapp, ingen undertext i video.

| Markör | Min bredd skärm | Min bredd tryck | Min bredd video (1080p) |
|---|---|---|---|
| Sigill | 32 px | 12 mm | 96 px |
| Ordbild | 160 px | 45 mm | 320 px |
| Krön | 240 px | 60 mm | 480 px |

---

## 4. Färg

Monokrom ramp. `ink` är märkets svarta — **inte** `#000000`, som blir hålkänsla på skärm.

| Token | Värde | Roll |
|---|---|---|
| `--rk-ink` | `#111111` | Primär svart. Text, logotyp, knappar. |
| `--rk-void` | `#0d0d0d` | Djup bakgrund. Hero, mörka sektioner, videoslutbild. |
| `--rk-soot` | `#1e1e1e` | Upphöjd yta mot `void`. Kort, modaler. |
| `--rk-graphite` | `#555555` | Sekundär text, metadata, bildtexter. |
| `--rk-ash` | `#8a8a8a` | Inaktiv text, platshållare. |
| `--rk-smoke` | `#d4d4d4` | Ramar, avdelare, 1 px-linjer. |
| `--rk-bone` | `#f2f2f2` | Alternativ ljus bakgrund, sektionsbyten. |
| `--rk-paper` | `#ffffff` | Grundbakgrund, text på mörkt. |
| `--rk-gilt` | `#b08d57` | *Valfri* dämpad mässing. Endast jubileum/utmärkelser. Aldrig i logotypen. |

**Kontrastregler**

`ink` på `paper` = 17.4:1 ✓ · `paper` på `void` = 18.9:1 ✓ · `graphite` på `paper` = 7.4:1 ✓ · `ash` på `paper` = 3.5:1 → **endast ≥ 18 px eller inaktiv text**.

**Överlägg på foto**

- Hero: `linear-gradient(to top, rgba(0,0,0,.82) 0%, rgba(0,0,0,.2) 55%, transparent 100%)`
- Kort: `linear-gradient(135deg, rgba(0,0,0,.92) 0%, rgba(30,30,30,.75) 100%)`
- Videoplatta bakom vit logotyp på rörigt underlag: `rgba(0,0,0,.35)`

---

## 5. Typografi

Logotypen är en högkontrast-Didone. Systemtypografin speglar den.

| Roll | Typsnitt | Vikt | Anmärkning |
|---|---|---|---|
| Display / rubrik | **Playfair Display** | 700 / 900 | Närmaste fria släkting till logotypens Didone. Versaler, `letter-spacing: .04em`. |
| Underrubrik / etikett | **Inter** | 500 | Versaler, `letter-spacing: .18em`. Det är här `STHLM ARTISTRY`-känslan lever. |
| Brödtext | **Inter** | 400 | Gemener, `line-height: 1.6`. |

```
https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Inter:wght@400;500;600&display=swap
```

**Skala** (1.25 för gränssnitt, 1.333 för redaktionellt/video)

| Token | px | Användning |
|---|---|---|
| `--rk-text-xs` | 12 | Versala småetiketter |
| `--rk-text-sm` | 14 | Metadata, bildtext |
| `--rk-text-base` | 16 | Brödtext |
| `--rk-text-lg` | 20 | Ingress |
| `--rk-text-xl` | 25 | H3 |
| `--rk-text-2xl` | 33 | H2 |
| `--rk-text-3xl` | 44 | H1 |
| `--rk-text-4xl` | 59 | Hero |
| `--rk-text-5xl` | 79 | Videotitel / affisch |

**Regler**

- Rubriker: alltid VERSALER, alltid `Playfair Display`.
- Radlängd i brödtext: 60–75 tecken.
- Aldrig kursiv i rubrik. Aldrig understruket utom länkar i löpande text.

---

## 6. Rum, form, linje

| Token | Värde |
|---|---|
| Spacing-steg | `4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128` px |
| `--rk-radius-none` | `0` — standard. Märket är kantigt. |
| `--rk-radius-pill` | `999px` — **endast** knappar och taggar. |
| Linje | `1px solid var(--rk-smoke)` på ljust, `1px solid rgba(255,255,255,.14)` på mörkt |
| Skugga | Ingen mjuk skugga i gränssnitt. Djup skapas med `void` mot `soot`. |

---

## 7. Rörelse

Ceremoniellt = långsamt och rakt. Inga studsar, ingen elasticitet.

| Token | Värde |
|---|---|
| `--rk-ease` | `cubic-bezier(.22,.61,.36,1)` |
| `--rk-dur-fast` | `160ms` — hover, fokus |
| `--rk-dur-base` | `320ms` — kort, flikar |
| `--rk-dur-slow` | `640ms` — sektionsavtäckning |
| `--rk-dur-cinematic` | `1200ms` — logotypavtäckning i video |

Respektera `prefers-reduced-motion: reduce` → slå av allt utom opacitet.

---

## 8. Video — specifikation

Skrivet för att kunna följas rakt av i CapCut / Premiere / After Effects.

### 8.1 Format

| Kanal | Upplösning | Bildrutor | Säker zon |
|---|---|---|---|
| Reel / TikTok / Shorts | 1080 × 1920 | 30 fps | 120 px topp, **420 px botten** (gränssnitt täcker) |
| Feed (kvadrat) | 1080 × 1080 | 30 fps | 80 px runt om |
| Story | 1080 × 1920 | 30 fps | 250 px topp, 250 px botten |
| Landskap / hemsida | 1920 × 1080 | 25 fps | 90 px runt om |
| Master / 4K | 3840 × 2160 | 25 fps | 180 px runt om |

### 8.2 Vattenstämpel (hela klippet)

- Fil: `video/rk-watermark-white-1920x1080.png` (eller `-black-` på ljust material) — välj den som matchar projektets format och lägg den som helbildslager överst
- Storlek: **6 % av bildens kortsida** → 1080 bred = 65 px, 2160 = 130 px
- Placering: övre högra hörnet, 48 px från båda kanterna (vid 1080)
- Opacitet: **55 %** — redan inbakad i de färdiga video-filerna
- Rör sig aldrig. Ingen animation, ingen puls.
- Vid rörigt underlag: mörk cirkelplatta `rgba(0,0,0,.35)` bakom, radie 1.6× sigillets.

### 8.3 Nedre tredjedel (artist / studio)

- Fil: `video/rk-lowerthird-1920x1080.png` (genomskinlig, ordbild redan i säker zon)
- Höjd på ordbilden: 4 % av bildhöjden
- Ovanför: artistnamn i `Playfair Display 900`, VERSALER
- Under: roll i `Inter 500`, VERSALER, `.18em`, färg `--rk-ash`
- In: ordbilden maskas fram vänster→höger `640ms`, `--rk-ease`. Text tonar in `320ms` med `120ms` fördröjning.
- Ut: allt tonar ut samtidigt `320ms`.
- Ligger kvar: 3,5 s.

### 8.4 Slutbild

- Fil: `video/rk-endcard-1080x1920.png` / `-1920x1080` / `-1080x1080` / `-3840x2160`
- Bakgrund `#0d0d0d`, krönet i vitt centrerat, 62 % av bildbredden
- Längd: 2,0 s
- In: krönet skalar `1.04 → 1.00` och tonar in över `1200ms`, `--rk-ease`. Ingen rotation.
- Valfritt: `@royalkave` i `Inter 500` versaler `.18em`, `--rk-ash`, 96 px under krönet.

### 8.5 Snitt och gradering

- Klipp på taktslag. Inga korsövergångar mellan tatueringsbilder — hårda snitt.
- Enda tillåtna övergång: **tona till svart** (`#0d0d0d`), 400 ms, vid kapitelbyte.
- Gradering: höj kontrasten, sänk mättnaden ~20 %. Hudton behåller färg — bläck ska läsas som svart, inte blått.
- Ljudnivå: −14 LUFS för sociala kanaler.

---

## 9. Assetmanifest

> **Det här är ett engångs-byggsteg som du kör själv — inte något Claude Design ska köra.**
> Claude Design läser de färdiga PNG:erna i `logos/dist/`. Se §9.4.

Källfilerna läggs i `logos/source/`. Kör sedan — `cd` först, annars hittas inte skriptet:

```bash
cd c:/ReactProjects/inkrevenue/design-system/royalkave
node prepare-logos.mjs
```

Skriptet identifierar varje källfil automatiskt (på bildmått och ljushet), trimmar bort tom yta, gör bakgrunden genomskinlig och skriver hela uppsättningen nedan till `logos/dist/`.

### 9.1 Källfiler (6 st → `logos/source/`)

| Motiv | Mått | Variant |
|---|---|---|
| Sigill | 6328 × 6328 | svart |
| Sigill | 6328 × 6328 | vit |
| Ordbild | 7762 × 1418 | svart |
| Ordbild | 7762 × 1418 | vit |
| Krön | 4834 × 4344 | svart |
| Krön | 4834 × 4344 | vit |

Filnamnen spelar ingen roll — skriptet sorterar på mått och ljushet.

### 9.2 Genererade filer (`logos/dist/`)

Alla med **genomskinlig bakgrund**, 8-bitars RGBA-PNG.

```
rk-seal-black-{256,512,1024,2048}.png        kvadratiska, trimmade
rk-seal-white-{256,512,1024,2048}.png
rk-wordmark-black-{512,1024,2048,4096}.png   bredd-styrda
rk-wordmark-white-{512,1024,2048,4096}.png
rk-crest-black-{512,1024,2048,4096}.png
rk-crest-white-{512,1024,2048,4096}.png
rk-favicon-{32,64,180,512}.png               sigill, svart
```

### 9.3 Videofärdiga filer (`logos/dist/video/`)

```
rk-watermark-white-{1080x1920,1080x1080,1920x1080,3840x2160}.png
rk-watermark-black-{1080x1920,1080x1080,1920x1080,3840x2160}.png
        sigill i övre högra hörnet, 6 % av kortsidan, 55 % opacitet inbakad

rk-lowerthird-1920x1080.png     ordbild vänsterställd i säker zon, genomskinlig
rk-lowerthird-1080x1920.png

rk-endcard-1080x1920.png        krön centrerat på #0d0d0d
rk-endcard-1080x1080.png
rk-endcard-1920x1080.png
rk-endcard-3840x2160.png

rk-titlecard-1080x1920.png      ordbild centrerad på #0d0d0d — öppningsbild
rk-titlecard-1920x1080.png
```

Skriptet skriver även `logos/dist/MANIFEST.md` med varje fil och dess storlek.

### 9.4 Så når Claude Design bilderna

Det här dokumentet innehåller **ingen bilddata** — bara sökvägar. Bilderna når fram på ett av två sätt:

| Läge | Vad du gör |
|---|---|
| Claude Design körs i projektet med filåtkomst | Ge den dokumentet. Sökvägarna nedan pekar rätt och den kan läsa PNG:erna direkt. |
| Claude Design körs i ett chattfönster | Ge den dokumentet **och bifoga** de PNG:er den ska använda i samma meddelande. |

Absolut rot på den här maskinen:

```
c:/ReactProjects/inkrevenue/design-system/royalkave/logos/dist/
```

Vanligast: `rk-wordmark-white-1024.png` (mörk bakgrund), `rk-wordmark-black-1024.png` (ljus),
`rk-seal-white-512.png` (vattenstämpel), `rk-crest-white-2048.png` (slutbild/affisch).

Vattenstämpel- och nedre tredjedel-filerna är **helbildslager**: lägg dem överst på tidslinjen i full storlek, allt är redan rätt placerat och opacitetssatt.

---

## 10. Att göra / att inte göra

**Gör**

- Använd vit variant på allt mörkare än `--rk-graphite`.
- Låt logotypen ha luft. Hellre för liten än för trång.
- Håll all rörelse rak och långsam.
- Sätt rubriker i versaler.

**Gör inte**

- ❌ Färglägg logotypen. Ingen guld, ingen gradient, ingen rosa.
- ❌ Skala om i x/y separat, rotera eller luta.
- ❌ Lägg kontur, glöd, mjuk skugga eller 3D-fasning.
- ❌ Sätt om `ROYAL KAVE` i ett annat typsnitt — ordbilden är en bild, inte text.
- ❌ Byt O:et i ROYAL mot ett vanligt O.
- ❌ Lägg krönet på foto utan mörk platta bakom.
- ❌ Använd `#000000` som märkessvart — det är `#111111` / `#0d0d0d`.
- ❌ Animera vattenstämpeln.

---

## 11. Kod

### 11.1 CSS

Tokens ligger i [`tokens.css`](./tokens.css) och [`tokens.json`](./tokens.json).

```html
<link rel="stylesheet" href="/design-system/royalkave/tokens.css">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
```

```css
.rk-h1 {
  font-family: var(--rk-font-display);
  font-weight: var(--rk-heading-weight);
  text-transform: uppercase;
  letter-spacing: .04em;
  font-size: var(--rk-text-3xl);
  color: var(--rk-ink);
}
.rk-label {
  font-family: var(--rk-font-body);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: .18em;
  font-size: var(--rk-text-xs);
  color: var(--rk-graphite);
}
.rk-btn {
  background: var(--rk-ink);
  color: var(--rk-paper);
  border-radius: var(--rk-radius-pill);
  padding: 14px 32px;
  font-family: var(--rk-font-body);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: .12em;
  transition: opacity var(--rk-dur-fast) var(--rk-ease);
}
.rk-btn:hover { opacity: .82; }
```

### 11.2 Logotyp i React

```jsx
const RK_LOGO = {
  seal:     (v, s = 512)  => `/logos/rk-seal-${v}-${s}.png`,
  wordmark: (v, s = 1024) => `/logos/rk-wordmark-${v}-${s}.png`,
  crest:    (v, s = 1024) => `/logos/rk-crest-${v}-${s}.png`,
};

// Ordbild i sidhuvud på mörk bakgrund
<img src={RK_LOGO.wordmark("white", 1024)} alt="Royal Kave" height={28} />
```

### 11.3 Förhållandet till studiosidan i inkrevenue

`inkrevenue/frontend/src/pages/studios/index.js` → `studioRegistry.royalkave` bär idag
`fontHeading: 'Barlow Condensed'`. **Det stämmer inte med märket** — logotypen är en Didone.
`tokens.json` innehåller därför båda:

- `font.display` = `Playfair Display` (rätt, framåt)
- `legacy.fontHeading` = `Barlow Condensed` (vad som ligger i prod idag)

Byt i `studioRegistry` när sidan uppdateras nästa gång, annars driftar tryck och webb isär.

> ⚠️ Studiosidan finns i **två** komponenter — `StudioPage` och `ThemedStudioPage`. Royal Kave har tema, alltså renderas den av `ThemedStudioPage`. Ändringar måste göras på båda.

---

## 12. Kortprompt till Claude Design

> Bygg för **The Royal Kave**, tatueringsstudio i Stockholm, grundad 2008.
> Strikt monokrom: `#111111` bläcksvart, `#0d0d0d` djupsvart, `#f2f2f2` benvit, `#ffffff` papper, `#555555` grafit. Ingen färg.
> Rubriker: Playfair Display 900, VERSALER, `letter-spacing .04em`. Brödtext: Inter 400. Etiketter: Inter 500, VERSALER, `.18em`.
> Kanter är raka (`radius: 0`) — enda undantaget är knappar och taggar som är helt runda (`999px`).
> Inga mjuka skuggor. Djup skapas med svart mot svart.
> Rörelse: `cubic-bezier(.22,.61,.36,1)`, 160/320/640 ms. Inga studsar.
> Tonalitet: heraldisk och knapphändig — krona, lagerkrans, fleur-de-lis, cirkelsigill. Hovmässigt, inte gatustil.
> Logotypen är bild, aldrig satt text. Vit variant på mörkt, svart på ljust, inget annat.
