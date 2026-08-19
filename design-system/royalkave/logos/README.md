# Royal Kave — logotyper

```
logos/
  source/   ← lägg de sex originalen här (görs en gång)
  dist/     ← genereras, checka gärna in
    video/  ← färdiga videolager
```

## 1. Lägg originalen i `source/`

Sex filer. **Filnamnen spelar ingen roll** — skriptet känner igen dem på bildmått och ljushet.

| Motiv | Mått | Variant |
|---|---|---|
| Sigill (cirkel, krönt rävhuvud, 20 / 08) | 6328 × 6328 | svart |
| Sigill | 6328 × 6328 | vit |
| Ordbild (`ROYAL KAVE`) | 7762 × 1418 | svart |
| Ordbild | 7762 × 1418 | vit |
| Krön (stort K med lagerkrans) | 4834 × 4344 | svart |
| Krön | 4834 × 4344 | vit |

Både genomskinlig bakgrund och massiv vit/svart bakgrund fungerar — skriptet nycklar bort bakgrunden och behåller kantutjämningen.

## 2. Kör beredningen

```bash
cd c:/ReactProjects/inkrevenue/design-system/royalkave
node prepare-logos.mjs
```

Behöver `sharp`. Skriptet letar i den här mappen först och faller sedan tillbaka på
installationen i `clothespin/node_modules`. Saknas den helt: `npm i sharp`.

Annan källmapp går att peka ut:

```bash
node prepare-logos.mjs "C:/Users/<du>/Downloads/royalkave-logos"
```

## 3. Resultat

44 PNG-filer i `dist/` och `dist/video/`, plus `dist/MANIFEST.md`.
Alla med genomskinlig bakgrund utom slutbild och öppningsbild, som har massiv `#0d0d0d`.

Vad varje fil är till för står i [`../ROYALKAVE-DESIGN-SYSTEM.md`](../ROYALKAVE-DESIGN-SYSTEM.md) §8–9.

## 4. Kör om

Skriptet skriver över `dist/` varje gång. Ändra bara originalen i `source/` och kör igen —
`dist/` ska aldrig redigeras för hand.
