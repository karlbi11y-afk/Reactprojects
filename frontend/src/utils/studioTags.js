export function getStudioTags(studio) {
  return [
    ...(Array.isArray(studio.styles) ? studio.styles : []),
    ...(Array.isArray(studio.publicProfile?.artworkTags)
      ? studio.publicProfile.artworkTags
      : [])
  ].filter(Boolean);
}
