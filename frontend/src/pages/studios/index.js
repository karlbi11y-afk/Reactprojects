// Studio page registry — maps studio slug → { theme, cardTheme }.
// Studios NOT listed here use the standard StudioProfilePage and default card styling.
//
// theme:     passed to ThemedStudioPage — controls the full studio page look
// cardTheme: passed to PublicStudioCard — controls catalog card gradient + badge colors
//
// All theme fields are optional; missing fields fall back on DEFAULT_THEME in ThemedStudioPage.jsx.
//
// To add a new customer:
//   1. Add an entry below with their slug
//   2. Set theme colors/fonts to match their website
//   3. Set cardTheme.gradient to match their brand color for the catalog card

export const studioRegistry = {
  royalkave: {
    theme: {
      bg: "#ffffff",
      bgAlt: "#f2f2f2",
      bgDark: "#0d0d0d",
      text: "#111111",
      textLight: "#ffffff",
      textMuted: "#555555",
      accent: "#111111",
      accentText: "#ffffff",
      heroOverlay:
        "linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.2) 55%, transparent 100%)",
      fontHeading: "'Barlow Condensed', 'Arial Narrow', Arial, sans-serif",
      fontBody: "'Inter', 'Helvetica Neue', Arial, sans-serif",
      googleFonts:
        "https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;900&family=Inter:wght@400;500&display=swap",
      headingTransform: "uppercase",
      headingWeight: 900,
      borderRadius: 999,
    },
    cardTheme: {
      // Black/white gradient to match their monochrome brand
      gradient: "linear-gradient(135deg, rgba(0,0,0,0.92) 0%, rgba(30,30,30,0.75) 100%)",
      badgeBg: "#111111",
      badgeText: "#ffffff",
      ctaBg: "#111111",
      ctaText: "#ffffff",
    },
  },
};
