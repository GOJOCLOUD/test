// Helper function to sanitize text for use in bookmark IDs
export function sanitizeForBookmarkId(text: string): string {
  // Remove non-alphanumeric characters (except underscores), replace spaces with underscores
  // Ensure it starts with a letter or underscore
  let sanitized = text.replace(/[^a-zA-Z0-9_\s]/g, "").replace(/\s+/g, "_");
  if (!/^[a-zA-Z_]/.test(sanitized)) {
    sanitized = "_" + sanitized;
  }
  // Truncate if necessary (Word has limits, though usually generous)
  return sanitized.substring(0, 40);
}