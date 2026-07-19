/**
 * Converts a string into a URL-safe lowercase slug.
 * 
 * @param text - The string to transform.
 * @returns The generated slug.
 */
export function slugify(text: string): string {
  return text
    .toString()                               // Cast to string just in case
    .toLowerCase()                            // Convert to lowercase
    .trim()                                   // Remove leading/trailing whitespace
    .normalize('NFD')                         // Decompose accents (e.g., 'é' becomes 'e' + '´')
    .replace(/[\u0300-\u036f]/g, '')         // Strip away the detached accents
    .replace(/[^a-z0-9\s-_]/g, '')            // Remove all symbols except letters, numbers, spaces, hyphens, and underscores
    .replace(/[\s_]+/g, '-')                  // Replace spaces and underscores with a single hyphen
    .replace(/-+/g, '-')                      // Collapse consecutive hyphens (e.g., '---' -> '-')
    .replace(/^-+|-+$/g, '');                 // Trim hyphens from the start and end
}