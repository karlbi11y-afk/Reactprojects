import { strict as assert } from "node:assert";
import { describe, it } from "node:test";
import {
  formatCampaignDeadline,
  isLastDay,
  selectVisibleCampaigns
} from "./campaignBanner.js";

/**
 * Körs med `node --test src/utils/campaignBanner.test.js` — frontenden har ingen
 * testrunner, och de här funktionerna är ren logik utan DOM.
 *
 * Varje tidpunkt är en absolut instant och "nu" skickas alltid in. Ett test som
 * läser den riktiga klockan går grönt i september och rött i oktober.
 */

describe("formatCampaignDeadline", () => {
  it("skriver ut slutdygnet i studions zon, inte i webbläsarens", () => {
    // 2026-09-13T21:59:59.999Z = söndag 13 september 23:59:59.999 svensk tid.
    assert.match(formatCampaignDeadline("2026-09-13T21:59:59.999Z"), /13 september/);
  });

  it("hamnar inte på gårdagens datum för en instant strax före svensk midnatt", () => {
    // Utan timeZone: "Europe/Stockholm" skulle en process i UTC skriva ut den 13:e
    // (rätt av en slump) men en klient i UTC-3 den 13:e kl 18:59 — och en instant
    // som 2026-06-30T22:00:00.000Z (1 juli svensk tid) hade blivit 30 juni.
    assert.match(formatCampaignDeadline("2026-06-30T21:59:59.999Z"), /30 juni/);
    assert.match(formatCampaignDeadline("2026-07-01T21:59:59.999Z"), /1 juli/);
  });

  it("skriver ut rätt dygn över sommartidsbytet i oktober", () => {
    // 25 oktober 2026 är 25 timmar långt; fönstret slutar 22:59:59.999Z (CET).
    assert.match(formatCampaignDeadline("2026-10-25T22:59:59.999Z"), /25 oktober/);
  });

  it("kan formateras på engelska", () => {
    assert.match(formatCampaignDeadline("2026-09-13T21:59:59.999Z", "en-GB"), /13 September/);
  });

  it("ger tom sträng för ett ogiltigt datum", () => {
    assert.equal(formatCampaignDeadline(null), "");
    assert.equal(formatCampaignDeadline("inte ett datum"), "");
  });
});

describe("isLastDay", () => {
  it("är sant när fönstret slutar samma svenska dygn som nu", () => {
    assert.equal(
      isLastDay("2026-09-13T21:59:59.999Z", new Date("2026-09-13T08:00:00.000Z")),
      true
    );
  });

  it("är sant även strax före midnatt svensk tid, alltså efter UTC-midnatt", () => {
    // 2026-09-13T21:30Z är 23:30 svensk tid den 13:e. Räknat i UTC vore både
    // instanten och "nu" fortfarande den 13:e här, men en klient i UTC+13 hade
    // legat på den 14:e utan zonen.
    assert.equal(
      isLastDay("2026-09-13T21:59:59.999Z", new Date("2026-09-13T21:30:00.000Z")),
      true
    );
  });

  it("är falskt dagen före", () => {
    assert.equal(
      isLastDay("2026-09-13T21:59:59.999Z", new Date("2026-09-12T08:00:00.000Z")),
      false
    );
  });

  it("är falskt för ett ogiltigt datum", () => {
    assert.equal(isLastDay(null, new Date("2026-09-13T08:00:00.000Z")), false);
  });
});

describe("selectVisibleCampaigns", () => {
  const tattooOnly = {
    id: "c_v37",
    label: "Gratis eftervårdspaket",
    endsAt: "2026-09-13T21:59:59.999Z",
    bookingTypes: ["tattoo_session"]
  };

  it("visar kampanjen för den valda typen", () => {
    assert.equal(selectVisibleCampaigns([tattooOnly], "tattoo_session").length, 1);
  });

  it("döljer kampanjen för en typ den inte gäller — bannern får inte lova mer än stämplingen ger", () => {
    assert.equal(selectVisibleCampaigns([tattooOnly], "consultation").length, 0);
  });

  it("visar allt när ingen typ valts ännu", () => {
    assert.equal(selectVisibleCampaigns([tattooOnly], null).length, 1);
  });

  it("visar en kampanj utan bookingTypes — äldre backendsvar döljs inte", () => {
    const legacy = { id: "c_old", label: "Erbjudande", endsAt: "2026-09-13T21:59:59.999Z" };

    assert.equal(selectVisibleCampaigns([legacy], "consultation").length, 1);
    assert.equal(
      selectVisibleCampaigns([{ ...legacy, bookingTypes: [] }], "consultation").length,
      1
    );
  });

  it("kastar bort skräp och kampanjer utan rubrik", () => {
    assert.equal(
      selectVisibleCampaigns([null, "x", { id: "c_1" }, tattooOnly], "tattoo_session").length,
      1
    );
    assert.deepEqual(selectVisibleCampaigns(undefined, "tattoo_session"), []);
  });
});
