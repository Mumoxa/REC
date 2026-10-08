/**
 * Auth callback `next` must stay on this origin. A leading slash is not enough:
 * `/\evil.com` and `\\` forms are parsed as a different host by the URL
 * constructor and become an open redirect.
 */
function hasControlCharacter(value: string) {
  for (const char of value) {
    const code = char.charCodeAt(0);
    if (code <= 31 || code === 127) return true;
  }
  return false;
}

export function safeNextPath(requested: string | null | undefined, origin: string): string {
  if (!requested) return "/";
  if (!requested.startsWith("/") || requested.startsWith("//")) return "/";
  if (requested.includes("\\") || hasControlCharacter(requested)) return "/";
  // Encoded CR/LF/null still become header or path tricks after some parsers.
  if (/%(?:0[0-9a-f]|1[0-9a-f]|7f)/i.test(requested)) return "/";

  try {
    const url = new URL(requested, origin);
    if (url.origin !== origin) return "/";
    if (url.pathname.startsWith("//")) return "/";
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "/";
  }
}
